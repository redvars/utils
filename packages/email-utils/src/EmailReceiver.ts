import Imap from "imap";

import { Logger, LoggerUtils } from "../deps.ts";
import * as mailparser from "nodemailer";
import replyParser from "node-email-reply-parser";

export function parseReply(mailText: string): string {
  return replyParser(mailText, true);
}

/*export function parseMail(buffer: string): Promise<any> {
  return mailparser.simpleParser(buffer);
}*/

export default class EmailReceiveHandler {
  #imap: any;
  #logger: Logger;

  constructor(config: any) {
    this.#imap = new Imap(config);
    this.#logger = LoggerUtils.defineLogger(EmailReceiveHandler.name);
  }

  connect(resolve: any, reject: any): void {
    let firstSkipped = false;
    let totalMessagesInInbox = 0;

    this.#imap.once("ready", () => {
      this.#logger.info("IMAP receiver ready");
      this.#imap.openBox("INBOX", true, (_err: any, box: any) => {
        totalMessagesInInbox = box.messages.total;
        this.#logger.info(`Total Inbox Messages [${totalMessagesInInbox}]`);
      });
    });

    this.#imap.on("mail", (numNewMsgs: number) => {
      if (!firstSkipped) {
        firstSkipped = true;
        return;
      }

      const fetch = this.#imap.seq.fetch(totalMessagesInInbox + 1 + ":*", {
        bodies: [""]
      });

      totalMessagesInInbox = totalMessagesInInbox + numNewMsgs;

      fetch.on("message", (message: any, seqno: any) => {
        message.on("body", function (stream: any, _info: any) {
          let buffer = "";
          stream.on("data", function (chunk: any) {
            buffer += chunk.toString();
          });
          stream.once("end", function () {
            resolve({ buffer, seqno });
          });
        });
      });

      fetch.once("error", (err: Error) => {
        reject(err);
      });
    });

    this.#imap.on("error", (err: Error) => {
      reject(err);
      this.#logger.error(err);
    });

    this.#imap.on("end", () => {
      this.#logger.info("Connection ended");
    });

    this.#imap.on("close", (err: Error) => {
      console.log(err);
      this.#logger.info(
        "Connection closed. Will retry to connect after 10 secs"
      );
      setTimeout(() => {
        this.#imap.connect();
      }, 10000);
    });

    this.#imap.connect();
  }

  end(): any {
    return this.#imap.end();
  }
}
