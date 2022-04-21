import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@emon-workstation/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
