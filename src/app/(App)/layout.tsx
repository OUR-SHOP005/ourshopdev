import Footer from "@/components/footer";
import NavbarServer from "@/components/NavbarServer";
import Copilot from "@/components/Copilot";
import UserSync from "@/components/UserSync";

export default function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className=''>
      <NavbarServer />
      <UserSync />
      <div className='container mx-auto px-4 py-12'>{children}</div>
      <Copilot />
      <Footer />
    </div>
  );
}
