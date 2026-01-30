const Input = ({ className, ...props }) => {
    return (
        <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg blur opacity-20 group-hover:opacity-60 transition duration-500"></div>
            <input
                className={`relative w-full bg-[#0a0515]/80 border border-white/10 text-white px-4 py-3 rounded-lg font-sans focus:outline-none focus:border-cyan-500/50 placeholder-gray-600 transition-all ${className}`}
                {...props}
            />
        </div>
    );
};

export default Input;
