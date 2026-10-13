import { Link } from "react-router-dom";
import { HiArrowLeft, HiExclamationTriangle } from "react-icons/hi2";
import { getSession } from "../../services/apiClient";

export default function NotFound() {
  const destination = getSession()?.user ? "/dashboard" : "/login";

  return (
    <main className="grid min-h-screen place-items-center overflow-hidden bg-[#f5f7fc] px-6">
      <div className="relative w-full max-w-[610px] overflow-hidden rounded-3xl border border-indigo-100 bg-white px-7 py-16 text-center shadow-[0_20px_60px_rgba(46,61,121,.12)] sm:px-14">
        <div className="absolute -left-14 -top-16 h-48 w-48 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute -bottom-20 -right-14 h-52 w-52 rounded-full bg-sky-100 blur-3xl" />
        <div className="relative">
          <div className="mx-auto grid h-20 w-20 place-items-center rounded-3xl bg-[#fff4f5] text-[#e85b70] shadow-sm">
            <HiExclamationTriangle className="h-10 w-10" />
          </div>
          <p className="mt-7 text-7xl font-black tracking-[-.08em] text-[#202b48] sm:text-8xl">
            404
          </p>
          <h1 className="mt-4 text-2xl font-bold text-[#263149]">
            Sahifa topilmadi
          </h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-slate-500">
            Siz qidirayotgan sahifa mavjud emas yoki uning manzili o‘zgargan.
          </p>
          <Link
            to={destination}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-[#5657e9] px-5 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-200 transition hover:bg-[#4848d7]"
          >
            <HiArrowLeft className="h-4 w-4" />
            Bosh sahifaga qaytish
          </Link>
        </div>
      </div>
    </main>
  );
}
