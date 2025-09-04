export default function Footer() {
  return (
    <footer className="bg-gray-200 text-center p-4 mt-6">
      <p className="text-gray-600 text-sm">
        &copy; {new Date().getFullYear()} Book Review App. All rights reserved.
      </p>
    </footer>
  );
}