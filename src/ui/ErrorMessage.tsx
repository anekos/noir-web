export default function ErrorMessage({children}) {
  return (
    <span className="rounded-md bg-red-800 p-3 text-white font-bold">
      {children}
    </span>
  )
}
