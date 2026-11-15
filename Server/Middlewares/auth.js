import { getAuth } from '@clerk/express'

export const protect = async (req, res, next) => {
    try {
        let userId = req.userId

        if (!userId && req.auth) {
            userId = typeof req.auth === 'function' ? req.auth()?.userId : req.auth?.userId
        }

        if (!userId) {
            try {
                const authData = getAuth(req)
                userId = authData?.userId
            } catch (err) {
                // getAuth failed
            }
        }

        if (!userId) {
            return res.json({ success: false, message: "not authenticated" })
        }

        req.userId = userId
        if (req.auth && typeof req.auth === 'function') {
            req.auth.userId = userId
        }

        next()
    } catch (error) {
        res.json({ success: false, message: error.message })
    }
}
