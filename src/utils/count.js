//backend/src/utils/count.js

import CompanyNotification from '../../DB/models/companyNotification.model.js';

const getNotificationCount = async (NotificationModel, sectionName, companyId) => {

    let query = { section: sectionName, response: null };
    if (NotificationModel === CompanyNotification && companyId) {
        query = { ...query, companyId: companyId };
    }
    const count = await NotificationModel.countDocuments(query);
    return count;
};

export default getNotificationCount;
