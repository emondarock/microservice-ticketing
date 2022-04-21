import {
  ExpirationCompleteEvent,
  Publisher,
  Subjects,
} from "@emon-workstation/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
