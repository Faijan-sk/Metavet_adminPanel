import JwtService from '../../@core/auth/jwt/jwtService'

// Create a single shared instance of JwtService
const jwt = new JwtService({})

export default jwt
