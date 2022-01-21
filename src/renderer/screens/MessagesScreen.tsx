import { useNavigate } from 'react-router';
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import classNames from 'classnames';
import NylasAccount from 'nylas/lib/models/account';
import NylasThread from 'nylas/lib/models/thread';
import NylasMessage from 'nylas/lib/models/message';
import NylasParticipant from 'nylas/lib/models/email-participant';
import { PencilAltIcon, UserCircleIcon } from '@heroicons/react/outline';
import ContentEditable, { ContentEditableEvent } from 'react-contenteditable';

const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Sign out', href: '#' },
];

export default function MessagesScreen() {
  const navigate = useNavigate();

  const [account, setAccount] = React.useState<NylasAccount>();
  const [threads, setThreads] = React.useState<NylasThread[]>();
  const [currentThread, setCurrentThread] = React.useState<string>('');
  const [threadMessages, setThreadMessages] = React.useState<
    (NylasMessage & { conversation?: string })[]
  >([]);
  const [activeDraft, setActiveDraft] = React.useState(false);

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
      <nav aria-label="Sidebar" className="messages-screen-sidebar">
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
                <span>{thread.id}</span>
                <div className="avatar thread-avatar--text">
                  <p>{participants[0].email.slice(0, 2)}</p>
                </div>
              </a>
            );
          })}
        </div>
      </nav>
    );
  };

  const Thread = ({ thread }: { thread: NylasThread | undefined }) => {
    if (!thread || !threadMessages) {
      return null;
    }

    return (
      <div className="thread">
        <div className="messages">
          {threadMessages.map((message) => {
            return <Message key={message.id} message={message} />;
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

    const participants = thread.participants.filter(
      (participant) => participant.email != account.emailAddress
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
  }: {
    message: (NylasMessage & { conversation?: string }) | undefined;
  }) => {
    const isFromMe =
      account?.emailAddress &&
      message?.from?.map((p) => p.email).includes(account?.emailAddress);

    return (
      <div
        className={classNames('message', isFromMe ? 'from-me' : 'from-them')}
      >
        {message?.conversation || message?.snippet}
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
    if (e.currentTarget.getAttribute('data-id') === 'close') {
      e.stopPropagation();
      return;
    }

    setCurrentThread('activeDraft');
  };

  const handleActiveDraftCloseClick = () => {
    const firstThreadId = (threads && threads[0]?.id) || '';
    setCurrentThread(firstThreadId);
    setActiveDraft(false);
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
  };

  const Composer = (props: ComposerProps) => {
    const ref = React.createRef<HTMLElement>();
    const [message, setMessage] = React.useState({ html: '' });

    const reset = () => {
      setMessage({ html: '' });
    };

    const sendMessage = (content: string): NylasMessage | null => {
      if (!props.thread || !account) {
        return null;
      }

      const participants = props?.thread?.participants.filter(
        (participant) => participant.email != account.emailAddress
      );

      try {
        const m = window.electron.drafts.send({
          message: {
            to: participants,
            threadId: props?.thread.id,
            subject: props?.thread.subject,
            body: content,
          },
        });

        reset();
        return m;
      } catch (e) {
        console.log(e);
        return null;
      }
    };

    const onSend = (content: string) => {
      const message = sendMessage(content);
      props?.onSend && props.onSend({ message, threadId: props?.thread?.id });
    };

    const onChange = (e: ContentEditableEvent) => {
      setMessage({
        html: e.target.value,
      });
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' && e.metaKey) {
        onSend(message.html);
      }
    };

    return (
      <div className="composer">
        <ContentEditable
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
      return <p>TODO: active draft compose a message</p>;
    }

    const thread = threads?.find((t) => t.id === currentThread);

    return (
      <>
        <Thread thread={thread} />
        <Composer onSend={afterSendSuccess} thread={thread} />
      </>
    );
  }, [currentThread, threadMessages]);

  return (
    <>
      <div className="messages-screen-container">
        {/* Top nav*/}
        <header className="messages-screen-header">
          <div className="messages-screen-header-logo-container">
            <div>
              <button onClick={handleNewMessageClick}>
                <PencilAltIcon className="icon icon--small icon--gray" />
              </button>
            </div>
          </div>

          {/* Desktop nav area */}
          <div className="desktop-nav-container">
            <div className="left">
              <div className="">
                <div className="icon-container">
                  <ThreadParticipants
                    thread={threads?.find((t) => t.id === currentThread)}
                  />
                </div>
              </div>
            </div>
            <div className="right">
              <div className="actions">
                <Menu as="div" className="menu-button-container">
                  <Menu.Button className="menu-button">
                    <span className="">Open user menu</span>
                    {account && (
                      <div className="account-avatar--text">
                        <p>{account.name.slice(0, 2)}</p>
                      </div>
                    )}
                  </Menu.Button>

                  <Transition
                    as={Fragment}
                    enter="enter"
                    enterFrom="enterFrom"
                    enterTo="enterTo"
                    leave="leave"
                    leaveFrom="leaveFrom"
                    leaveTo="leaveTo"
                  >
                    <Menu.Items className="menu-items">
                      <div className="menu-items-container">
                        {userNavigation.map((item) => {
                          return (
                            <Menu.Item key={item.href}>
                              {({ active }) => (
                                <a
                                  href={item.href}
                                  className={classNames(
                                    active ? 'active' : '',
                                    'menu-item'
                                  )}
                                >
                                  {item.name}
                                </a>
                              )}
                            </Menu.Item>
                          );
                        })}
                      </div>
                    </Menu.Items>
                  </Transition>
                </Menu>
              </div>
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
