import {
  Publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@emon-workstation/common";

export class TicketUpdatedPublisher extends Publisher<TicketUpdatedEvent> {
  readonly subject = Subjects.TicketUpdated;
}
