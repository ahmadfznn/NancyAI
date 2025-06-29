export default function ErrorCard({ message }: { message: string }) {
  return (
    <div className="bg-red-500 text-white p-2 rounded mb-2">{message}</div>
  );
}
