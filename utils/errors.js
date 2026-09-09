const sendServerError = (res, error, message) => {
    console.error(message, error);
    return res.status(500).json({ message });
};

module.exports = { sendServerError };