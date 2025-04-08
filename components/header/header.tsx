"use client";

import Link from "next/link";
import { useState } from "react";
import { BurgerIcon } from "./icons/burger-icon";
import clsx from "clsx";
import { useAppDispatch } from "@/lib/redux/hooks";
import { goToPage } from "@/lib/redux/catsSlice";

export function Header() {
  const dispatch = useAppDispatch();
  const [isBurgerOpen, setIsBurgerOpen] = useState(false);

  return (
    <div className="w-full bg-slate-100 shadow-xs">
      <div className="max-w-[1200px] mx-auto px-[15px] py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center">
          <div className="font-medium text-lg sm:text-xl md:text-2xl">
            AppLogo
          </div>
        </Link>

        <nav className="hidden md:block">
          <ul className="flex space-x-6 text-base">
            <li className="hover:text-sky-500 hover:underline underline-offset-4 transition-colors">
              <button onClick={() => dispatch(goToPage(1))}>
                <Link href="/products">Все продукты</Link>
              </button>
            </li>
            <li className="hover:text-sky-500 hover:underline underline-offset-4 transition-colors">
              <Link href="/create-product">Создать продукт</Link>
            </li>
          </ul>
        </nav>

        <div className="flex md:hidden items-center">
          <button
            className={clsx("p-2", isBurgerOpen && "text-sky-500")}
            onClick={() => setIsBurgerOpen(!isBurgerOpen)}
          >
            <BurgerIcon />
          </button>
        </div>
      </div>

      {isBurgerOpen && (
        <div className="md:hidden absolute left-0 right-0 bg-slate-100 shadow-lg">
          <nav className="px-2 pt-2 pb-4 space-y-1">
            <Link
              href="/products"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-200"
              onClick={() => setIsBurgerOpen(false)}
            >
              Все продукты
            </Link>
            <Link
              href="/create-product"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-slate-200"
              onClick={() => setIsBurgerOpen(false)}
            >
              Создать продукт
            </Link>
          </nav>
        </div>
      )}
    </div>
  );
}
