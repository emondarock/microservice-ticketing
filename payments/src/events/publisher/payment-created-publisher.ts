import {
  PaymentCreatedEvent,
  Publisher,
  Subjects,
} from "@emon-workstation/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
