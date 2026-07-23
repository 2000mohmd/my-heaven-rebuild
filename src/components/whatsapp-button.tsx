const WHATSAPP_NUMBER = "96171325349"; // no plus, digits only
const DEFAULT_MSG = "Hi Heaven Beauty! I'd like to ask about your products.";

export function WhatsAppButton() {
  const href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(DEFAULT_MSG)}`;
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-5 right-5 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 md:bottom-6 md:right-6"
    >
      <svg
        viewBox="0 0 32 32"
        fill="currentColor"
        aria-hidden="true"
        className="h-7 w-7"
      >
        <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.315.245-.716.245-1.06 0-.386-2.406-1.633-2.708-1.633zm-2.622 5.323a9.104 9.104 0 0 1-9.132-9.132 9.104 9.104 0 0 1 9.132-9.132 9.104 9.104 0 0 1 9.132 9.132 9.104 9.104 0 0 1-9.132 9.132zm0-20.036c-5.997 0-10.876 4.879-10.876 10.876 0 1.905.499 3.774 1.44 5.404L3.5 25.5l6.115-1.6a10.87 10.87 0 0 0 5.16 1.319h.005c5.996 0 10.876-4.879 10.876-10.876 0-2.906-1.131-5.638-3.188-7.696a10.807 10.807 0 0 0-7.688-3.19z" />
      </svg>
    </a>
  );
}
