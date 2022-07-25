import { useNavigate } from 'react-router';
import React from 'react';
import classNames from 'classnames';
import NylasAccount from 'nylas/lib/models/account';
import NylasThread from 'nylas/lib/models/thread';
import NylasMessage from 'nylas/lib/models/message';
import NylasParticipant, {
  EmailParticipantProperties,
} from 'nylas/lib/models/email-participant';
import {
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  PencilAltIcon,
  UserCircleIcon,
} from '@heroicons/react/outline';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';
import { ReactMultiEmail, isEmail } from 'react-multi-email';
import 'react-multi-email/style.css';
import { DraftProperties } from 'nylas/lib/models/draft';
import uniqBy from 'lodash.uniqby';
import isEqual from 'lodash.isequal';

export default function MessagesScreen() {
  const navigate = useNavigate();

  const [account, setAccount] = React.useState<NylasAccount>();
  const [threads, setThreads] = React.useState<NylasThread[]>();
  const [currentThread, setCurrentThread] = React.useState<string>('');
  const [threadMessages, setThreadMessages] = React.useState<
    (NylasMessage & { conversation?: string })[]
  >([]);
  const [activeDraft, setActiveDraft] = React.useState(false);
  const [activeDraftTo, setActiveDraftTo] = React.useState<string[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = React.useState<boolean>(false);

  React.useEffect(() => {
    const loggedIn = window.electron.store.get('access_token');

    if (!loggedIn) {
      navigate('/login');
    }
  }, []);

  React.useEffect(() => {
    const account = window.electron.account.get();
    setAccount(account);
  }, []);

  React.useEffect(() => {
    const threads = window.electron.threads.get();
    setCurrentThread(threads[0]?.id || '');
    setThreads(threads);
  }, []);

  React.useEffect(() => {
    if (
      !currentThread ||
      currentThread === 'activeDraft' ||
      currentThread === 'firstTimeSenders' ||
      currentThread === 'replyLater' ||
      currentThread === 'setAside'
    ) {
      return;
    }

    const messageIds = threads?.find((t) => t.id === currentThread)?.messageIds;
    const messages = window.electron.threads.getMessages({
      messageIds: messageIds,
    });
    setThreadMessages(messages);
  }, [currentThread]);

  const Sidebar = () => {
    if (!threads || threads.length === 0 || !account) {
      return null;
    }

    return (
      <>
        <nav
          aria-label="Sidebar"
          className={classNames(
            'messages-screen-sidebar',
            sidebarExpanded && 'expanded'
          )}
        >
          <div className="messages-screen-header-logo-container sidebar-action-container">
            {sidebarExpanded ? (
              <div>search</div>
            ) : (
              <div>
                <button onClick={handleNewMessageClick}>
                  <PencilAltIcon className="icon icon--small icon--gray" />
                </button>
              </div>
            )}
          </div>
          <div className="sidebar-items-container">
            {activeDraft && (
              <div
                onClick={handleActiveDraftClick}
                className={classNames(
                  currentThread === 'activeDraft' ? 'active' : '',
                  'sidebar-item'
                )}
              >
                <span>activeDraft</span>
                <div className="avatar">
                  <button
                    onClick={handleActiveDraftCloseClick}
                    data-id="close"
                    className="badge"
                  >
                    <svg
                      data-id="close"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        data-id="close"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                  <UserCircleIcon />
                </div>
              </div>
            )}

            {threads.map((thread) => {
              const participants = thread.participants.filter(
                (participant) => participant.email != account.emailAddress
              );

              return (
                <a
                  key={thread.id}
                  onClick={() => handleThreadClick(thread.id || '')}
                  className={classNames(
                    thread.id === currentThread ? 'active' : '',
                    thread?.unread && 'unread',
                    'sidebar-item'
                  )}
                >
                  {sidebarExpanded ? (
                    <div className="thread-item">
                      <span>{thread.id}</span>
                      <div className="avatar-container">
                        <div className="avatar thread-avatar--text">
                          <p>{participants[0].email.slice(0, 2)}</p>
                        </div>
                      </div>
                      <div>
                        <p className="title">{participants[0].email}</p>
                        <p className="snippet">
                          {thread?.snippet.slice(0, 99)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <span>{thread.id}</span>
                      <div className="avatar thread-avatar--text">
                        <p>{participants[0].email.slice(0, 2)}</p>
                      </div>
                    </>
                  )}
                </a>
              );
            })}
            <div className="sidebar-item"></div>
          </div>
        </nav>
      </>
    );
  };

  const Thread = ({ thread }: { thread: NylasThread | undefined }) => {
    if (!thread || !threadMessages) {
      return null;
    }

    return (
      <div className="thread">
        <div className="messages">
          {threadMessages.map((message, index) => {
            const consecutive =
              index > 1
                ? isEqual(threadMessages[index - 1]?.from, message.from)
                : false;

            return (
              <Message
                key={message.id}
                message={message}
                consecutive={consecutive}
              />
            );
          })}
        </div>
      </div>
    );
  };

  const ThreadParticipants = ({
    thread,
  }: {
    thread: NylasThread | undefined;
  }) => {
    if (!thread || !account) {
      return null;
    }

    const participants = uniqBy(
      thread.participants.filter(
        (participant) => participant.email != account.emailAddress
      ),
      (participant) => {
        return participant.email;
      }
    );

    const Participant = ({
      participant,
    }: {
      participant: NylasParticipant;
    }) => {
      return (
        <div className="thread-participant">
          <span className="">{participant.email}</span>
        </div>
      );
    };

    return (
      <div className="tread-participants-container">
        <span>To: </span>
        <div className="thread-participants">
          {participants.map((participant) => (
            <Participant key={participant.email} participant={participant} />
          ))}
        </div>
      </div>
    );
  };

  const Message = ({
    message,
    consecutive = false,
  }: {
    message: (NylasMessage & { conversation?: string }) | undefined;
    consecutive?: boolean;
  }) => {
    const isFromMe =
      account?.emailAddress &&
      message?.from?.map((p) => p.email).includes(account?.emailAddress);

    // const frame = React.useRef();
    // React.useEffect(() => {
    //   if (!frame) {
    //     return
    //   }

    //   frame.current.contentWindow.document.write(message?.body)
    // }, [frame])

    return (
      <div
        className={classNames(
          'message',
          isFromMe ? 'from-me' : 'from-them',
          consecutive && 'no-tail'
        )}
      >
        {message?.conversation || message?.snippet}
        {/* <iframe ref={frame} /> */}
        {/* <div dangerouslySetInnerHTML={{__html: message?.body}} /> */}
      </div>
    );
  };

  const handleThreadClick = (threadId: string) => {
    setCurrentThread(threadId);
  };

  const handleNewMessageClick = () => {
    setActiveDraft(true);
    setCurrentThread('activeDraft');
  };

  const handleActiveDraftClick = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    if (e.target.getAttribute('data-id') === 'close') {
      e.stopPropagation();
      return;
    }

    setCurrentThread('activeDraft');
  };

  const handleActiveDraftCloseClick = () => {
    const firstThreadId = (threads && threads[0]?.id) || '';
    setCurrentThread(firstThreadId);
    setActiveDraft(false);
    setActiveDraftTo([]);
  };

  const afterSendSuccess = ({
    message,
    threadId,
  }: {
    message: NylasMessage | null;
    threadId?: string;
  }) => {
    if (threadId && message) {
      setThreadMessages([message, ...threadMessages]);
    }

    if (currentThread === 'activeDraft') {
      setActiveDraftTo([]);
      afterNewMessage(message);
    }
  };

  const afterNewMessage = (message: NylasMessage | null) => {
    if (!message || !message?.id || !message?.threadId) {
      return;
    }

    if (threads) {
      setThreads([
        {
          id: message.threadId,
          messageIds: [message.id],
          subject: message?.subject || '',
          participants: message.to,
        },
        ...threads,
      ]);
    }

    setCurrentThread(message.threadId);
    setThreadMessages([message]);
    setActiveDraft(false);
  };

  const handleExpandSidebar = () => {
    setSidebarExpanded(!sidebarExpanded);
  };

  type ComposerProps = {
    onSend?: ({
      message,
      threadId,
    }: {
      message: NylasMessage | null;
      threadId?: string;
    }) => void;
    thread?: NylasThread;
    to?: EmailParticipantProperties[];
  };

  const Composer = (props: ComposerProps) => {
    const ref = React.createRef<HTMLElement>();
    const [message, setMessage] = React.useState({ html: '' });
    const [subject, setSubject] = React.useState('');

    const reset = () => {
      setSubject('');
      setMessage({ html: '' });
    };

    const sendMessage = (
      content: string,
      subject?: string
    ): NylasMessage | null => {
      if (!props.thread && !props.to) {
        return null;
      }

      if (!account) {
        return null;
      }

      let message: any = {};

      if (props.thread) {
        message.to = props?.thread?.participants.filter(
          (participant) => participant.email != account.emailAddress
        );
        message.threadId = props?.thread.id;
        message.subject = props?.thread.subject;
      }

      if (props.to) {
        message.subject = subject;
        message.to = props.to;
      }

      message.body = content;

      try {
        const m = window.electron.drafts.send({
          message: message as DraftProperties,
        });

        reset();
        return m;
      } catch (e) {
        console.log(e);
        return null;
      }
    };

    const onSend = (content: string, subject: string) => {
      const message = sendMessage(content, subject);
      props?.onSend && props.onSend({ message, threadId: props?.thread?.id });
    };

    const onChange = (e: ContentEditableEvent) => {
      setMessage({
        html: e.target.value,
      });
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && e.metaKey) {
        onSend(message.html, subject);
      }
    };

    return (
      <div className="composer">
        {!props.thread && (
          <input
            className="input"
            placeholder="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        )}
        <ContentEditable
          placeholder="message"
          innerRef={ref}
          html={message.html}
          disabled={false}
          onKeyDown={onKeyDown}
          onChange={onChange}
          className="input"
        />
      </div>
    );
  };

  const RenderMain = React.useCallback(() => {
    if (!currentThread) {
      return null;
    }

    if (currentThread === 'activeDraft') {
      return (
        <>
          <div className="thread"></div>
          <Composer
            to={activeDraftTo.map((email) => {
              return {
                email: email,
              } as NylasParticipant;
            })}
            onSend={afterSendSuccess}
          />
        </>
      );
    }

    const thread = threads?.find((t) => t.id === currentThread);

    return (
      <>
        <Thread thread={thread} />
        <Composer onSend={afterSendSuccess} thread={thread} />
      </>
    );
  }, [currentThread, threadMessages, activeDraftTo]);

  return (
    <>
      <div className="messages-screen-container">
        {/* Top nav*/}
        <header className="messages-screen-header">
          <div
            className={classNames(
              'messages-screen-header-logo-container',
              sidebarExpanded && 'expanded'
            )}
          >
            <div>
              <button onClick={handleExpandSidebar}>
                {sidebarExpanded ? (
                  <ChevronDoubleLeftIcon className="icon icon--small icon--gray" />
                ) : (
                  <ChevronDoubleRightIcon className="icon icon--small icon--gray" />
                )}
              </button>
            </div>

            {sidebarExpanded && (
              <div>
                <button onClick={handleNewMessageClick}>
                  <PencilAltIcon className="icon icon--small icon--gray" />
                </button>
              </div>
            )}
          </div>

          {/* Desktop nav area */}
          <div className="desktop-nav-container">
            <div className="left">
              <div className="">
                <div className="icon-container">
                  {activeDraft && currentThread === 'activeDraft' ? (
                    <>
                      To:{' '}
                      <ReactMultiEmail
                        emails={activeDraftTo}
                        onChange={(emails) => {
                          setActiveDraftTo(emails);
                        }}
                        validateEmail={(email) => {
                          return isEmail(email);
                        }}
                        getLabel={(
                          email: string,
                          index: number,
                          removeEmail: (index: number) => void
                        ) => {
                          return (
                            <div data-tag key={index}>
                              {email}
                              <span
                                data-tag-handle
                                onClick={() => removeEmail(index)}
                              >
                                ×
                              </span>
                            </div>
                          );
                        }}
                      />
                    </>
                  ) : (
                    <ThreadParticipants
                      thread={threads?.find((t) => t.id === currentThread)}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="right">
              <div className="actions"></div>
            </div>
          </div>
        </header>

        {/* Bottom section */}
        <div className="messages-screen-bottom">
          {/* Narrow sidebar*/}
          <Sidebar />

          {/* Main area */}
          <main className="messages-screen-main">
            {/* Primary column */}
            <section aria-labelledby="primary-heading" className="content">
              {/* Your content */}
              <RenderMain />
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
