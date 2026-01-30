const Card = ({ children, className }) => {
    return (
        <div className={`glass-panel p-6 rounded-2xl relative overflow-hidden group ${className}`}>
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative">
                {children}
            </div>
        </div>
    );
};

export default Card;
