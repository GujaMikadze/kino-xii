import Modal from "../components/Modal";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import { useAuth } from "./useAuth";

export default function AuthModals() {
  const { authModal, closeAuthModal } = useAuth();
  const isLogin = authModal === "login";

  return (
    <Modal
      open={authModal !== null}
      onClose={closeAuthModal}
      title={isLogin ? "Log in" : "Sign up"}
      subtitle={isLogin ? "Welcome back to Kino XII" : "Welcome to Kino XII"}
      className={isLogin ? "w-[440px]" : "w-[520px]"}
    >
      {isLogin ? <LoginForm /> : <RegisterForm />}
    </Modal>
  );
}