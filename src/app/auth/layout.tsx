import { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

const AuthLayout = ({ children }: Props) => {
  return (
    <div className="flex justify-center w-full items-center min-h-screen authBackground">
      {children}
    </div>
  );
};

export default AuthLayout;
