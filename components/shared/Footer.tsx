import Image from "next/image";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="border-b">
      <div className="flex-center wrapper flex-between flex flex-col gap-4 p-5 text-center sm:flex-row">
        <Link href="/">
          <Image
            src="/assets/images/logo.png"
            alt="Logo"
            width={128}
            height={38}
          />
        </Link>
        <p>2025 IConnect. All Rights Reserved  </p>
      </div>
    </footer>
  );
};

export default Footer;
