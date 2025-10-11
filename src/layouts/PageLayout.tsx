import { Navbar } from "@/components/navbar/Navbar";

interface IPageLayoutProps {
  children: React.ReactNode;
}

const PageLayout = ({ children }: IPageLayoutProps) => {
  return (
    <>
      <Navbar />
      <main>{children}</main>
    </>
  );
};
export { PageLayout };
