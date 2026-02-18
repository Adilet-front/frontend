/**
 * Виджет авторизации: прокидывает mode в LoginForm (используется на LoginPage).
 */
import { LoginForm } from "../../features/auth/ui/LoginForm";

type LoginWidgetProps = {
  mode?: "login" | "register";
};

export const LoginWidget = ({ mode }: LoginWidgetProps) => (
  <LoginForm mode={mode} />
);
