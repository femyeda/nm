import { useNavigate } from 'react-router';
import React, { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { SearchIcon } from '@heroicons/react/solid';
import classNames from 'classnames';
import {
  ArchiveIcon,
  BanIcon,
  BellIcon,
  FlagIcon,
  InboxIcon,
  PencilAltIcon,
  UserCircleIcon,
} from '@heroicons/react/outline';

const user = {
  name: 'Whitney Francis',
  email: 'whitneyfrancis@example.com',
  imageUrl:
    'https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
};
const sidebarNavigation = [
  { name: 'Open', href: '#', icon: InboxIcon, current: true },
  { name: 'Archive', href: '#', icon: ArchiveIcon, current: false },
  { name: 'Customers', href: '#', icon: UserCircleIcon, current: false },
  { name: 'Flagged', href: '#', icon: FlagIcon, current: false },
  { name: 'Spam', href: '#', icon: BanIcon, current: false },
  { name: 'Drafts', href: '#', icon: PencilAltIcon, current: false },
];
const userNavigation = [
  { name: 'Your Profile', href: '#' },
  { name: 'Sign out', href: '#' },
];

export default function MessagesScreen() {
  const navigate = useNavigate();

  React.useEffect(() => {
    const loggedIn = window.electron.store.get('access_token');

    if (!loggedIn) {
      navigate('/login');
    }
  }, []);

  const handleNewMessageClick = () => {
    console.log("TODO handleNewMessageClick")
  }

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
                <label htmlFor="desktop-search" className="sr-only">
                  Search
                </label>
                <input
                  id="desktop-search"
                  type="search"
                  placeholder="Search"
                  className=""
                />
                <div className="icon-container">
                  <SearchIcon className="icon" aria-hidden="true" />
                </div>
              </div>
            </div>
            <div className="right">
              <div className="actions">
                <span className="">
                  <a href="#" className="">
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="icon" aria-hidden="true" />
                  </a>
                </span>

                <Menu as="div" className="menu-button-container">
                  <Menu.Button className="menu-button">
                    <span className="">Open user menu</span>
                    <img className="" src={user.imageUrl} alt="" />
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
                            <Menu.Item>
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
          <nav aria-label="Sidebar" className="messages-screen-sidebar">
            <div className="sidebar-items-container">
              {sidebarNavigation.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={classNames(
                    item.current ? 'active' : '',
                    'sidebar-item'
                  )}
                >
                  <span>{item.name}</span>
                  <item.icon className="icon" aria-hidden="true" />
                </a>
              ))}
            </div>
          </nav>

          {/* Main area */}
          <main className="messages-screen-main">
            {/* Primary column */}
            <section aria-labelledby="primary-heading" className="content">
              {/* Your content */}
            </section>
          </main>
        </div>
      </div>
    </>
  );
}
