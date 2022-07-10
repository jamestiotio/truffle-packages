import { useMemo } from "https://npm.tfl.dev/haunted@5";
import PropTypes from "https://npm.tfl.dev/prop-types@15";

import { toDist } from "https://tfl.dev/@truffle/distribute@1.0.0/format/wc/index.js";
import { createSubject } from "https://tfl.dev/@truffle/utils@0.0.2/obs/subject.js";
import useObservables from "https://tfl.dev/@truffle/utils@0.0.2/obs/use-observables-haunted.js";
import {
  _clearCache,
  gql,
  mutation,
} from "https://tfl.dev/@truffle/api@0.1.0/client.js";
import { setCookie } from "https://tfl.dev/@truffle/utils@0.0.2/cookie/cookie.js";
// unsafeStatic was solution to https://stackoverflow.com/a/59833334
import {
  html,
  unsafeStatic,
} from "https://npm.tfl.dev/lit-html@2/static?bundle";

import Button from "../button/button.tag.ts";
import Dialog from "../dialog/dialog.tag.ts";
import TextField from "../text-field/text-field.tag.ts";
import Stylesheet from "../stylesheet/stylesheet.tag.ts";
import { emit } from "../../utils/event.ts";

const JOIN_MUTATION = gql`mutation UserJoin($input: UserJoinInput!) {
  userJoin(input: $input) { accessToken }
}`;
const RESET_PASSWORD_MUTATION = gql
  `mutation UserResetPassword($input: UserResetPasswordInput!) {
  userResetPassword(input: $input) { hasSentResetEmail }
}`;
const LOGIN_MUTATION = gql
  `mutation UserLoginEmailPhone($input: UserLoginEmailPhoneInput!) {
  userLoginEmailPhone(input: $input) { accessToken }
}`;

function AuthDialog({ hidden }) {
  const onClose = () => {
    emit(this, "close");
  };

  const { modeSubject, isLoadingSubject, hasErrorSubject, fields } = useMemo(
    () => {
      return {
        modeSubject: createSubject("join"),
        isLoadingSubject: createSubject(false),
        hasErrorSubject: createSubject(false),
        fields: {
          name: {
            valueSubject: createSubject(""),
            errorSubject: createSubject(),
          },
          emailPhone: {
            valueSubject: createSubject(""),
            errorSubject: createSubject(),
          },
          password: {
            valueSubject: createSubject(""),
            errorSubject: createSubject(),
          },
        },
      };
    },
    [],
  );

  const { mode, isLoading } = useObservables(() => ({
    mode: modeSubject.obs,
    isLoading: isLoadingSubject.obs,
  }));

  const onSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) {
      return;
    }
    // reset errors
    Object.values(fields).forEach((field) => {
      field.errorSubject.next(null);
    });

    isLoadingSubject.next(true);
    let mutationRes;
    if (mode === "login") {
      mutationRes = await mutation(LOGIN_MUTATION, {
        input: {
          ...parseEmailPhone(fields.emailPhone.valueSubject.getValue()),
          password: fields.password.valueSubject.getValue(),
        },
      });
    } else if (mode === "reset") {
      mutationRes = await mutation(RESET_PASSWORD_MUTATION, {
        input: {
          ...parseEmailPhone(fields.emailPhone.valueSubject.getValue()),
        },
      });
    } else {
      mutationRes = await mutation(JOIN_MUTATION, {
        input: {
          name: fields.name.valueSubject.getValue(),
          ...parseEmailPhone(fields.emailPhone.valueSubject.getValue()),
          password: fields.password.valueSubject.getValue(),
        },
      });
      // TODO: cleanup and handle login/reset
      const accessToken = mutationRes?.data?.userJoin?.accessToken;
      if (accessToken) {
        setCookie("accessToken", accessToken);
        _clearCache();
      }
      isLoadingSubject.next(false);
    }

    if (mutationRes?.error) {
      // TODO: surely a cleaner way to do this
      const errorInfo = mutationRes?.error?.graphQLErrors?.[0]?.extensions
        ?.info;

      console.log("error", errorInfo);

      hasErrorSubject.next(true);
      const errorSubject = fields[errorInfo?.field]?.errorSubject ||
        fields.emailPhone.errorSubject;
      // TODO: better error messages
      errorSubject.next(errorInfo?.langKey || "Error");
    } else {
      onClose?.();
    }
  };

  const actionText = mode === "login"
    ? "Login"
    : mode === "reset"
    ? "Reset"
    : "Join";

  return html`<${unsafeStatic(Dialog)}
    hidden=${hidden}
    modal=${true}
    @cancel=${onClose}
    @close=${onClose}
  >
    <${unsafeStatic(Stylesheet)} .url="${new URL(
    "./auth-dialog.css",
    import.meta.url,
  )}"></${unsafeStatic(Stylesheet)}>
    <form @submit=${onSubmit}>
      ${Header({ actionText, modeSubject })}
      ${Content({ mode, fields })}
      ${Footer({ actionText, isLoading })}
    </form>
  </${unsafeStatic(Dialog)}>`;
}

AuthDialog.propTypes = {
  hidden: PropTypes.bool,
  onClose: PropTypes.func,
  abc: PropTypes.string,
};

function Content({ mode, fields }) {
  return html`
  ${
    mode === "join"
      ? InputWrapper({ label: "Display name", field: fields.name })
      : ""
  }
  ${InputWrapper({ label: "Email or phone #", field: fields.emailPhone })}
  ${
    InputWrapper({
      label: "Password",
      type: "password",
      field: fields.password,
    })
  }`;
}

const InputWrapper = function InputWrapper({ type = "text", label, field }) {
  const { value, error } = useObservables(() => ({
    value: field.valueSubject.obs,
    error: field.errorSubject.obs,
  }));

  return html`<div class=${`input-wrapper ${error ? "has-error" : ""}`}>
    <${unsafeStatic(TextField)}
      type=${type}
      value=${value}
      @input=${(e) => field.valueSubject.next(e.target.value)}
    >
      ${label}
    </${unsafeStatic(TextField)}>
    ${error && html`<div class="error">${error}</div>`}
  </div>`;
};

function Header({ modeSubject, actionText }) {
  const { mode } = useObservables(() => ({
    mode: modeSubject.obs,
  }));

  const toggleMode = () => {
    modeSubject.next(mode === "login" ? "join" : "login");
  };

  return html`<div class="header">
    <div class="title">${actionText}</div>
    <div class="description">
      Already have an account?
      <span class="login-toggle" @click=${toggleMode}>
        ${mode === "login" ? "Join" : "Login"}
      </span>
    </div>
  </div>`;
}

function Footer({ actionText, isLoading }) {
  return html`<div class="footer">
    <${
    unsafeStatic(Button)
  } appearance="primary" type="submit" loading=${isLoading}>
      ${actionText}
    </${unsafeStatic(Button)}>
  </div>`;
}

function parseEmailPhone(emailPhone) {
  const isPhone = emailPhone?.match(
    /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/,
  );
  if (isPhone) {
    return { phone: emailPhone };
  } else {
    return { email: emailPhone };
  }
}

export default toDist("haunted", AuthDialog, import.meta.url);
