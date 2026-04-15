const Footer = ({ className = "" }: { className?: string }) => {
  return (
    <footer className={`fixed bottom-0 left-0 right-0 py-3 border-t border-gray-200 bg-gray-50 z-40 ${className}`} style={{ margin: 0 }}>
      <div className="text-center">
        <p className="text-sm text-gray-500 font-light m-0">
          © {new Date().getFullYear()} Sanvii Techmet Pvt Ltd. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
