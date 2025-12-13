import { Toaster } from "react-hot-toast";

export const metadata = {
  title: "Web 2.0 | Pagos",
};

export default function CarritoLayout({ children }: { children: React.ReactNode }) {
  return (
    <section >
      <Toaster position="bottom-center"/>
      {children}
    </section>
  );
}
