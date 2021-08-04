import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { withUnstatedContainers } from './UnstatedUtils';
import AppContainer from '../services/AppContainer';
import { toastSuccess, toastError } from '../util/apiNotification';


const PasswordResetExecutionForm = (props) => {
  const { t, appContainer /* personalContainer */ } = props;

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [validationErrorI18n, setValidationErrorI18n] = useState('');

  const changePassword = async(e) => {
    e.preventDefault();

    if (newPassword === '' || newPasswordConfirm === '') {
      setValidationErrorI18n('personal_settings.password_is_not_set');
      return;
    }

    if (newPassword !== newPasswordConfirm) {
      setValidationErrorI18n('forgot_password.password_and_confirm_password_does_not_match');
      return;
    }

    try {
      /*
      * TODO: hit an api to change password by GW-6778
      * the following code is just a reference
      */

      await appContainer.apiPut('/forgot-password', {
        newPassword,
      });

      setNewPassword('');
      setNewPasswordConfirm('');
      setValidationErrorI18n('');

      toastSuccess(t('toaster.update_successed', { target: t('Password') }));
    }
    catch (err) {
      toastError(err);
    }

  };

  return (
    <form role="form" onSubmit={changePassword}>
      <div className="form-group">
        <div className="input-group">
          <input
            name="password"
            placeholder={t('forgot_password.new_password')}
            className="form-control"
            type="password"
            onChange={e => setNewPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="form-group">
        <div className="input-group">
          <input
            name="password"
            placeholder={t('forgot_password.confirm_new_password')}
            className="form-control"
            type="password"
            onChange={e => setNewPasswordConfirm(e.target.value)}
          />
        </div>
        {validationErrorI18n !== '' && (
          <p className="text-danger mt-2">{t(validationErrorI18n)}</p>
        )}
      </div>
      <div className="form-group">
        <input name="reset-password-btn" className="btn btn-lg btn-primary btn-block" value={t('forgot_password.reset_password')} type="submit" />
      </div>
      <a href="/login">
        <i className="icon-login mr-1"></i>{t('forgot_password.sign_in_instead')}
      </a>
    </form>
  );
};

const PasswordResetExecutionFormWrapper = withUnstatedContainers(PasswordResetExecutionForm, [AppContainer]);

PasswordResetExecutionForm.propTypes = {
  t: PropTypes.func.isRequired, //  i18next
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};

export default withTranslation()(PasswordResetExecutionFormWrapper);
