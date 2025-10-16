# 🆓 Обновление Backend для httpOnly Cookies

## 🎯 Цель: Безопасная аутентификация БЕЗ localStorage

---

## Шаг 1: Установить зависимости (бесплатно)

```bash
cd C:\Users\User\Desktop\fooddelivery-backend

# Установить необходимые пакеты
npm install cookie-parser
npm install jsonwebtoken
```

---

## Шаг 2: Настроить cookie-parser middleware

### Обновить `src/main.ts` или `src/app.js`:

```typescript
import * as cookieParser from 'cookie-parser';

// В функции bootstrap() или app setup
app.use(cookieParser());

// CORS с credentials
app.enableCors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true, // ⚠️ ВАЖНО: разрешаем cookies
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
```

---

## Шаг 3: Обновить Auth Service

### Создать helper для cookies:

```typescript
// src/auth/auth.helper.ts

export const COOKIE_OPTIONS = {
  httpOnly: true, // Защита от XSS
  secure: process.env.NODE_ENV === 'production', // HTTPS только в prod
  sameSite: 'strict' as const, // CSRF защита
  path: '/',
};

export const ACCESS_TOKEN_COOKIE = 'accessToken';
export const REFRESH_TOKEN_COOKIE = 'refreshToken';

// Время жизни токенов
export const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 минут
export const REFRESH_TOKEN_EXPIRY = 7 * 24 * 60 * 60; // 7 дней
```

---

## Шаг 4: Обновить Login endpoint

```typescript
// src/auth/auth.controller.ts

import { Response } from 'express';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS } from './auth.helper';

@Post('login')
async login(
  @Body() loginDto: LoginDto,
  @Res({ passthrough: true }) response: Response,
) {
  const result = await this.authService.login(loginDto);
  
  // ✅ Установить access token в httpOnly cookie
  response.cookie(
    ACCESS_TOKEN_COOKIE,
    result.accessToken,
    {
      ...COOKIE_OPTIONS,
      maxAge: 15 * 60 * 1000, // 15 минут в миллисекундах
    }
  );
  
  // ✅ Установить refresh token в httpOnly cookie
  response.cookie(
    REFRESH_TOKEN_COOKIE,
    result.refreshToken,
    {
      ...COOKIE_OPTIONS,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 дней
    }
  );
  
  // ❌ НЕ отправляем токены в ответе!
  return {
    user: result.user,
    message: 'Вход выполнен успешно',
  };
}
```

---

## Шаг 5: Обновить Register endpoint

```typescript
@Post('register')
async register(
  @Body() registerDto: RegisterDto,
  @Res({ passthrough: true }) response: Response,
) {
  const result = await this.authService.register(registerDto);
  
  // Установить токены в cookies
  response.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });
  
  response.cookie(REFRESH_TOKEN_COOKIE, result.refreshToken, {
    ...COOKIE_OPTIONS,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  
  return {
    user: result.user,
    message: 'Регистрация успешна',
  };
}
```

---

## Шаг 6: Создать Refresh Token endpoint

```typescript
@Post('refresh')
async refreshToken(
  @Req() request: Request,
  @Res({ passthrough: true }) response: Response,
) {
  // Получить refresh token из cookie
  const refreshToken = request.cookies[REFRESH_TOKEN_COOKIE];
  
  if (!refreshToken) {
    throw new UnauthorizedException('Refresh token not found');
  }
  
  // Проверить и создать новый access token
  const result = await this.authService.refreshAccessToken(refreshToken);
  
  // Установить новый access token
  response.cookie(ACCESS_TOKEN_COOKIE, result.accessToken, {
    ...COOKIE_OPTIONS,
    maxAge: 15 * 60 * 1000,
  });
  
  return {
    message: 'Token refreshed successfully',
  };
}
```

---

## Шаг 7: Обновить Logout endpoint

```typescript
@Post('logout')
async logout(@Res({ passthrough: true }) response: Response) {
  // Удалить оба cookie
  response.clearCookie(ACCESS_TOKEN_COOKIE, COOKIE_OPTIONS);
  response.clearCookie(REFRESH_TOKEN_COOKIE, COOKIE_OPTIONS);
  
  return {
    message: 'Выход выполнен успешно',
  };
}
```

---

## Шаг 8: Обновить JWT Guard для чтения из cookies

```typescript
// src/auth/guards/jwt-auth.guard.ts

import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ACCESS_TOKEN_COOKIE } from '../auth.helper';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest();
    
    // Получить токен из cookie
    const token = request.cookies[ACCESS_TOKEN_COOKIE];
    
    if (token) {
      // Установить в header для стандартной обработки
      request.headers.authorization = `Bearer ${token}`;
    }
    
    return super.canActivate(context);
  }
}
```

---

## Шаг 9: Обновить JWT Strategy

```typescript
// src/auth/strategies/jwt.strategy.ts

import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ACCESS_TOKEN_COOKIE } from '../auth.helper';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Извлекать токен из cookie
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.[ACCESS_TOKEN_COOKIE];
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(), // Fallback
      ]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET,
    });
  }

  async validate(payload: any) {
    return {
      userId: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
```

---

## Шаг 10: Обновить Auth Service для refresh tokens

```typescript
// src/auth/auth.service.ts

async refreshAccessToken(refreshToken: string) {
  try {
    // Проверить refresh token
    const payload = this.jwtService.verify(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET,
    });
    
    // Создать новый access token
    const accessToken = this.jwtService.sign(
      {
        sub: payload.sub,
        email: payload.email,
        role: payload.role,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      }
    );
    
    return { accessToken };
  } catch (error) {
    throw new UnauthorizedException('Invalid refresh token');
  }
}
```

---

## Шаг 11: Обновить .env файл

```bash
# Backend .env
JWT_SECRET=your_super_secure_secret_key_256_bits_min
JWT_REFRESH_SECRET=your_refresh_secret_key_256_bits_min
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## Шаг 12: Тестирование

### Тест 1: Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"chef@test.com","password":"password123"}' \
  -c cookies.txt \
  -v
```

Должны увидеть в headers:
```
Set-Cookie: accessToken=xxx; HttpOnly; Secure; SameSite=Strict
Set-Cookie: refreshToken=xxx; HttpOnly; Secure; SameSite=Strict
```

### Тест 2: Protected endpoint
```bash
curl http://localhost:3001/api/users/me \
  -b cookies.txt \
  -v
```

### Тест 3: Refresh token
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -b cookies.txt \
  -c cookies.txt \
  -v
```

### Тест 4: Logout
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -b cookies.txt \
  -v
```

---

## Преимущества httpOnly cookies:

✅ **Защита от XSS** - JavaScript не может прочитать токены
✅ **Защита от CSRF** - SameSite=Strict
✅ **Автоматическая отправка** - браузер сам отправляет cookies
✅ **Безопасное хранение** - токены не в localStorage
✅ **Автоматический refresh** - прозрачно для пользователя

---

## Troubleshooting

### Проблема: CORS ошибка
**Решение:** Проверьте `credentials: true` в CORS config

### Проблема: Cookies не сохраняются
**Решение:** 
- В development: `secure: false`
- Проверьте `sameSite` настройки
- Frontend должен использовать `credentials: 'include'`

### Проблема: 401 Unauthorized
**Решение:** 
- Проверьте, что JwtStrategy читает из cookies
- Проверьте срок действия токена
- Используйте `/auth/refresh` для обновления

---

## 🎉 ГОТОВО!

Теперь ваш backend безопасно работает с httpOnly cookies!

**Никаких дополнительных затрат - все бесплатно!** 🆓

