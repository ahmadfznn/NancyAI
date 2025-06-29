export default function AuthCard({
  title,
  onSubmit,
  children,
}: {
  title: string;
  onSubmit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-gray-800 p-5 rounded shadow-md">
      <h2 className="text-xl text-white mb-4">{title}</h2>
      <form onSubmit={onSubmit}>{children}</form>
    </div>
  );
}
