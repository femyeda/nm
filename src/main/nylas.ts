import Nylas from 'nylas';
import EmailParticipant, {
  EmailParticipantProperties,
} from 'nylas/lib/models/email-participant';
import { FolderProperties, Label } from 'nylas/lib/models/folder';
import Message, { MessageProperties } from 'nylas/lib/models/message';
import RestfulModel from 'nylas/lib/models/restful-model';
import Thread, { ThreadProperties } from 'nylas/lib/models/thread';

export default ({
  access_token,
  client_id,
  client_secret,
}: {
  access_token: string;
  client_id: string;
  client_secret: string;
}) => {
  Nylas.config({
    clientId: client_id,
    clientSecret: client_secret,
  });

  return Nylas.with(access_token);
};

export function transformThread(
  thread: Thread
): ThreadProperties & Partial<RestfulModel> {
  return {
    id: thread.id,
    accountId: thread.accountId,
    object: thread.object,
    subject: thread.subject,
    participants: transformParticipants(thread.participants),
    lastMessageTimestamp: thread.lastMessageTimestamp,
    lastMessageReceivedTimestamp: thread.lastMessageReceivedTimestamp,
    firstMessageTimestamp: thread.firstMessageTimestamp,
    messageIds: thread.messageIds,
    snippet: thread.snippet,
    unread: thread.unread,
    starred: thread.starred,
    version: thread.version,
    lastMessageSentTimestamp: thread.lastMessageSentTimestamp,
    hasAttachments: thread.hasAttachments,
    labels: thread.labels ? transformLabels(thread.labels) : thread.labels,
    draftIds: thread.draftIds,
  };
}

export function transformThreads(
  threads: Thread[]
): (ThreadProperties & Partial<RestfulModel>)[] {
  return threads.map((thread) => {
    return transformThread(thread);
  });
}

export function transformMessage(
  message: Message
): MessageProperties & Partial<RestfulModel> {
  return {
    id: message.id,
    object: message.object,
    to: transformParticipants(message.to),
    subject: message.subject,
    from: message.from ? transformParticipants(message.from) : message.from,
    replyTo: message.replyTo
      ? transformParticipants(message.replyTo)
      : message.replyTo,
    cc: message.cc ? transformParticipants(message.cc) : message.cc,
    bcc: message.bcc ? transformParticipants(message.bcc) : message.bcc,
    date: message.date,
    threadId: message.threadId,
    snippet: message.snippet,
    body: message.body,
    unread: message.unread,
    starred: message.starred,
    conversation: message?.conversation ? message.conversation : '',
    // files: message.files,
    // events: message.events,
    labels: message.labels ? transformLabels(message.labels) : message.labels,
  };
}

export function transformMessages(
  messages: Message[]
): (MessageProperties & Partial<RestfulModel>)[] {
  return messages.map((Message) => {
    return transformMessage(Message);
  });
}

export function transformParticipants(
  participants: EmailParticipant[]
): EmailParticipantProperties[] {
  if (!participants) {
    return [];
  }

  return participants.map((participant) => {
    return {
      email: participant.email,
      name: participant.name,
    };
  });
}

export function transformLabels(labels: Label[]): FolderProperties[] {
  if (!labels) {
    return [];
  }

  return labels.map((label) => {
    return {
      name: label.name,
      displayName: label.displayName,
      jobStatusId: label.jobStatusId,
    };
  });
}
