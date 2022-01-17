import React from 'react';
import { useNavigate } from 'react-router';

export default function LoginScreen() {
  const navigate = useNavigate();

  const [accessToken, setAccessToken] = React.useState('');
  const [clientId, setClientId] = React.useState('');
  const [clientSecret, setClientSecret] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    window.electron.store.set('access_token', accessToken);
    window.electron.store.set('client_id', clientId);
    window.electron.store.set('client_secret', clientSecret);
    navigate('/');
  };

  return (
    <>
      <div className="screen-container">
        <div className="screen-header">
          <img
            className="screen-header-image"
            src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
            alt="Workflow"
          />
          <h2 className="screen-header-title">Sign in to your account</h2>
        </div>

        <div className="screen-body">
          <div className="form-container">
            <form className="form" onSubmit={handleSubmit}>
              <fieldset>
                <label htmlFor="client_id" className="label">
                  Nylas Client ID
                </label>
                <div className="">
                  <input
                    id="client_id"
                    name="client_id"
                    type="text"
                    required
                    className="input"
                    onChange={(e) => setClientId(e.target.value)}
                  />
                </div>
              </fieldset>
              <fieldset>
                <label htmlFor="client_secret" className="label">
                  Nylas Client Secret
                </label>
                <div className="">
                  <input
                    id="client_secret"
                    name="client_secret"
                    type="text"
                    required
                    className="input"
                    onChange={(e) => setClientSecret(e.target.value)}
                  />
                </div>
              </fieldset>
              <fieldset>
                <label htmlFor="access_token" className="label">
                  Nylas Access Token
                </label>
                <div className="">
                  <input
                    id="access_token"
                    name="access_token"
                    type="text"
                    required
                    className="input"
                    onChange={(e) => setAccessToken(e.target.value)}
                  />
                </div>
              </fieldset>

              <div>
                <button type="submit" className="button button__full">
                  Sign in
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
