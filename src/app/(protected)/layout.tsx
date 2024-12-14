export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ paddingTop: '75px' }}>
      {children}
    </div>
  );
}
