export default function Navbar() {
  return (
    <header className="fixed left-0 top-0 z-50 w-full">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-7">

        <div>
          <h2 className="text-xl font-medium tracking-tight">
            Fedor.
          </h2>

          <p className="text-xs text-gray-500">
            English Studio
          </p>
        </div>

        <nav className="hidden gap-10 text-sm text-gray-300 md:flex">
          <a href="#">История</a>
          <a href="#">Тест</a>
          <a href="#">Отзывы</a>
          <a href="#">Контакты</a>
        </nav>

        <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 p-1 backdrop-blur-xl">

          <button className="rounded-full bg-white px-4 py-2 text-sm text-black">
            RU
          </button>

          <button className="px-4 py-2 text-sm text-gray-400">
            EN
          </button>

        </div>

      </div>

      <div className="h-px bg-white/10"></div>
    </header>
  );
}