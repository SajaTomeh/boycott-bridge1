//backend/src/utils/readable.js



const makeNotificationReadable = async (req, res, NotificationModel, idParamName = 'id') => {

    const notification = await NotificationModel.findById(req.params[idParamName]);
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }


    // notification.response = "readable";
    if (req.body.response !== "readable") {
        return res.status(400).json({ message: "Response must only be equal to 'readable'" });
    }

    notification.response = req.body.response;

    await notification.save();

    return res.status(200).json({ message: "This notification has become readable" });
};

export default makeNotificationReadable;
