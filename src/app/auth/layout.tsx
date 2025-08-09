import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="flex justify-center w-full items-center min-h-screen bg-[url('/pattern/i-like-food.svg')] dark:bg-[url('/pattern/dark/i-like-food.svg')] bg-repeat bg-pattern bg-vignette">
      {children}
    </div>
  );
};

export default AuthLayout;
