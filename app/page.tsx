import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-[1200px] mx-auto px-[15px]">
      <div className="pt-20">
        <p className="text-xl">Привет!</p>
        <h1 className="text-4xl pt-2 max-w-1/2">
          Это приложение поможет управлять списоком продуктов.
        </h1>
      </div>
      <ul className="pt-10 pl-4 list-disc">
        <li className="hover:text-sky-500 hover:underline underline-offset-4 transition-colors text-lg">
          <Link href="/products">Смотреть все продукты</Link>
        </li>
        <div className="pl-4 mt-2">
          - Посмотреть общий список и применить фильтры.
        </div>
        <div className="pl-4 mt-1">
          - Открыть карточку продукта и отредактировать данные.
        </div>
        <div className="pl-4 mt-1">
          - Добавить продукт в избранное, поставив ему лайк, или удалить.
        </div>

        <li className="hover:text-sky-500 hover:underline underline-offset-4 transition-colors text-lg mt-6">
          <Link href="/create-product">Создать новый продукт</Link>
        </li>
      </ul>
    </div>
  );
}
