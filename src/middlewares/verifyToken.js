//backend/src/middlewares/verifyToken.js

import jwt from 'jsonwebtoken';
import AlternativeProduct from "../../DB/models/alternativeProduct.model.js";
import Review from '../../DB/models/review.model.js';



//////////////////////////////////////////////////////////////////////////////
// Handle token verification errors
const handleTokenError = (error, res) => {
    if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ message: "token expired, access denied" });
    } else {
        return res.status(401).json({ message: "invalid token, access denied" });
    }
};

// Extract token from authorization header
const extractToken = (authHeader) => {
    if (authHeader) {
        return authHeader.split(" ")[1];
    }
    return null;
};

// Verify token payload
const verifyTokenPayload = (token, res) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        handleTokenError(error, res);
        return null;
    }
};
//////////////////////////////////////////////////////////////////////////////


// Verify Token  (only checks if the token is valid, not the owner)
const verifyToken = (req, res, next) => {
    const token = extractToken(req.headers.authorization);
    if (token) {
        const decodedPayload = verifyTokenPayload(token, res);
        if (decodedPayload) {
            req.user = decodedPayload;
            next();
        }
    } else {
        return res.status(401).json({ message: "no token provided, access denied" });
    }
}

// Verify Company Token  (only checks if the token is valid, not the owner)
const verifyCompanyToken = (req, res, next) => {
    const token = extractToken(req.headers.authorization);
    if (token) {
        const decodedPayload = verifyTokenPayload(token, res);
        if (decodedPayload && decodedPayload.userType === 'company') {
            req.company = decodedPayload;
            next();
        } else {
            return res.status(401).json({ message: "invalid token, access denied" });
        }
    } else {
        return res.status(401).json({ message: "no token provided, access denied" });
    }
}

// Verify User or Company Token
const verifyUserOrCompanyToken = (req, res, next) => {
    const token = extractToken(req.headers.authorization);
    if (token) {
        const decodedPayload = verifyTokenPayload(token, res);
        if (decodedPayload) {
            if (decodedPayload.userType === 'company') {
                req.company = decodedPayload;
            } else {
                req.user = decodedPayload;
            }
            next();
        }
    } else {
        return res.status(401).json({ message: "no token provided, access denied" });
    }
}

// Verify Token & Admin (only admin)
const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.userType === 'admin') {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only admin" });
        }
    });
}

// Verify Token & Only User  (not admin)
const verifyTokenAndOnlyUser = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.userType === 'user') {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only user " });
        }
    });
}

// Verify Token Company & Only Company itself (id)  (not admin)
const verifyTokenCompanyAndOnlyCompanyItself = (req, res, next) => {
    verifyCompanyToken(req, res, () => {
        if (req.company && req.company.id === req.params.companyId) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only company itself" });
        }
    });
}

// Verify Token (user itself (id))
const verifyTokenAndUserItself = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user && req.user.id === req.params.userId) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only user himself" });
        }
    });
}

// Verify Token (user itself (id) || admin)
const verifyTokenAndUserItselfOrAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if ((req.user && req.user.id === req.params.userId) || (req.user && req.user.userType === 'admin')) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only user himself or admin" });
        }
    });
}

// Verify Token (company itself (id) || admin)
const verifyTokenCompanyItselfOrAdmin = (req, res, next) => {
    verifyUserOrCompanyToken(req, res, () => {
        if ((req.user && req.user.userType === 'admin') || (req.company && req.company.id === req.params.companyId)) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only company itself or admin" });
        }
    });
}

// Verify Token (user itself (id) || company itself (id))
const verifyTokenAccountHolder = (req, res, next) => {
    verifyUserOrCompanyToken(req, res, () => {
        if ((req.user && req.user.id === req.params.accountId) || (req.company && req.company.id === req.params.accountId)) {
            next();
        } else {
            return res.status(403).json({ message: "not allowed, only account holder can verify the account" });
        }
    });
}


// Verify Token (user itself (not admin) || company itself (owns the product))
const verifyTokenUserOrProductOwner = (req, res, next) => {
    verifyUserOrCompanyToken(req, res, async () => {
        if (req.user && req.user.userType === 'user') {
            next();
        } else if (req.company) {
            try {
                const product = await AlternativeProduct.findById(req.params.productId);
                if (product && String(product.createdBy) === String(req.company.id)) {
                    next();
                } else {
                    return res.status(403).json({ message: "not allowed, only the company that owns the product" });
                }
            } catch (error) {
                return res.status(500).json({ message: "internal server error" });
            }
        } else {
            return res.status(403).json({ message: "not allowed, only user or product owner company" });
        }
    });
}

// Verify Token (admin || user comment owner || company comment owner)
const verifyTokenAdminOrCommentOwner = (req, res, next) => {
    verifyUserOrCompanyToken(req, res, async () => {
        if (req.user && req.user.userType === 'admin') {
            next();
        } else {
            try {
                const review = await Review.findById(req.params.commentId);
                if (review) {
                    if (req.user && String(req.user.id) === String(review.userId)) {
                        next();
                    }
                    else if (req.company && String(req.company.id) === String(review.companyId)) {
                        next();
                    }
                    else {
                        return res.status(403).json({ message: "not allowed, only the comment owner or admin" });
                    }
                }
                else {
                    return res.status(404).json({ message: "comment not found" });
                }
            } catch (error) {
                return res.status(500).json({ message: "internal server error" });
            }
        }
    });
}

// Verify Token (user comment owner || company comment owner)
const verifyTokenCommentOwner = (req, res, next) => {
    verifyUserOrCompanyToken(req, res, async () => {
        try {
            const review = await Review.findById(req.params.commentId);
            if (review) {
                if (req.user && String(req.user.id) === String(review.userId)) {
                    next();
                }
                else if (req.company && String(req.company.id) === String(review.companyId)) {
                    next();
                }
                else {
                    return res.status(403).json({ message: "not allowed, only the comment owner" });
                }
            }
            else {
                return res.status(404).json({ message: "comment not found" });
            }
        } catch (error) {
            return res.status(500).json({ message: "internal server error" });
        }
    });
}



export {
    verifyToken,
    verifyTokenAndAdmin,
    verifyTokenAndOnlyUser,
    verifyTokenAndUserItself,
    verifyTokenAndUserItselfOrAdmin,

    verifyCompanyToken,
    verifyTokenCompanyAndOnlyCompanyItself,
    verifyTokenCompanyItselfOrAdmin,

    verifyTokenAccountHolder,

    verifyTokenUserOrProductOwner,
    verifyTokenAdminOrCommentOwner,
    verifyTokenCommentOwner
};
