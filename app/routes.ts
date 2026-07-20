
import {type RouteConfig, index, route} from "@react-router/dev/routes";


export default [
    index("routes/home.tsx"),
    route('/auth', 'routes/auth.tsx'),
    route('/forgot-password', 'routes/forgot-password.tsx'),
    route('/reset-password/:token', 'routes/reset-password.$token.tsx'),
    route('/logout', 'routes/logout.tsx'),
    route('/upload', 'routes/upload.tsx'),
    route('/history', 'routes/history.tsx'),
    route('/resume/:id', 'routes/resume.tsx'),
    route('/analysis/:id', 'routes/analysis.$id.tsx'),
    route('/optimize/:id', 'routes/optimize.$id.tsx'),
] satisfies RouteConfig;
