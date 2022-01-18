import { useNavigate } from 'react-router';
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import classNames from 'classnames';
import NylasAccount from 'nylas/lib/models/account';
import NylasThread from 'nylas/lib/models/thread';
import NylasMessage from 'nylas/lib/models/message';
import NylasParticipant from 'nylas/lib/models/email-participant';
import { PencilAltIcon } from '@heroicons/react/outline';

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
    if (!currentThread) {
      return;
    }

    const messageIds = threads?.find((t) => t.id === currentThread)?.messageIds;
    const messages = window.electron.threads.getMessages({
      messageIds: messageIds,
    });
    setThreadMessages(messages);
  }, [currentThread]);

  const handleThreadClick = (threadId: string) => {
    setCurrentThread(threadId);
  };

  const Sidebar = () => {
    if (!threads || threads.length === 0 || !account) {
      return null;
    }

    return (
      <nav aria-label="Sidebar" className="messages-screen-sidebar">
        <div className="sidebar-items-container">
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
        {message?.conversation ?? message?.snippet}
      </div>
    );
  };

  const handleNewMessageClick = () => {
    console.log('TODO handleNewMessageClick');
  };

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
              <Thread thread={threads?.find((t) => t.id === currentThread)} />
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
