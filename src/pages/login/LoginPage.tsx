/**
 * Страница входа/регистрации: обёртка над LoginWidget с mode из роута.
 */
import { LoginWidget } from "../../widgets/auth/LoginWidget";

type LoginPageProps = {
  mode?: "login" | "register" | "forgot";
};

export const LoginPage = ({ mode }: LoginPageProps) => (
  <LoginWidget mode={mode} />
);

export default LoginPage;
