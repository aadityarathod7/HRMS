const Footer = () => {
  return (
    <footer className="py-4 border-t border-gray-200 bg-gray-50">
      <div className="text-center">
        <p className="text-sm text-gray-500 font-light">
          © {new Date().getFullYear()} Sanvii Techmet Pvt Ltd. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
