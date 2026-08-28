"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = validate;
const zod_1 = require("zod");
function validate(schema) {
    return (req, res, next) => {
        try {
            schema.parse(req.body);
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`);
                res.status(400).json({
                    success: false,
                    error: 'Validation error',
                    message: messages.join('; '),
                });
                return;
            }
            next(error);
        }
    };
}
//# sourceMappingURL=validate.js.map