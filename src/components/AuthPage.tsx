import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { Loader2, Shield, Users, FileText, TrendingUp } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent, action: 'signin' | 'signup') => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      if (action === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          setError('Las contraseñas no coinciden');
          return;
        }
        await signUp(formData.email, formData.password);
        setError('Revisa tu email para confirmar tu cuenta');
      } else {
        await signIn(formData.email, formData.password);
      }
    } catch (err: any) {
      setError(err.message || 'Ocurrió un error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const fillTestData = (email: string, password: string) => {
    setFormData({
      email,
      password,
      confirmPassword: password
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Panel izquierdo - Branding */}
        <div className="hidden lg:block space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-gray-900">
              Asisti<span className="text-blue-600">Travel</span>
            </h1>
            <p className="text-xl text-gray-600">
              Sistema completo de gestión de casos y corresponsales médicos
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sistema Seguro</h3>
                <p className="text-sm text-gray-600">Autenticación robusta con roles</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Gestión Multi-Usuario</h3>
                <p className="text-sm text-gray-600">Admin, Editor, Visualizador</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Casos Completos</h3>
                <p className="text-sm text-gray-600">Gestión integral de casos</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Reportes Avanzados</h3>
                <p className="text-sm text-gray-600">Dashboard y estadísticas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Panel derecho - Login */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold text-center">
                Bienvenido a AsistiTravel
              </CardTitle>
              <CardDescription className="text-center">
                Ingresa tus credenciales para acceder al sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="signin" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="signin">Iniciar Sesión</TabsTrigger>
                  <TabsTrigger value="signup">Registrarse</TabsTrigger>
                </TabsList>

                <TabsContent value="signin">
                  <form onSubmit={(e) => handleSubmit(e, 'signin')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="admin@assistravel.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {error && (
                      <Alert>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Iniciar Sesión
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="signup">
                  <form onSubmit={(e) => handleSubmit(e, 'signup')} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input
                        id="email-signup"
                        name="email"
                        type="email"
                        placeholder="usuario@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Contraseña</Label>
                      <Input
                        id="password-signup"
                        name="password"
                        type="password"
                        placeholder="••••••••"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                      <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    {error && (
                      <Alert>
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Crear Cuenta
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>

              {/* Botones de usuarios de prueba */}
              <div className="mt-6 space-y-2">
                <p className="text-sm text-gray-600 text-center">Usuarios de prueba:</p>
                <div className="grid grid-cols-1 gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fillTestData('admin@assistravel.com', 'Admin123456!')}
                  >
                    Admin Demo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fillTestData('editor@assistravel.com', 'Admin123456!')}
                  >
                    Editor Demo
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => fillTestData('visualizador@assistravel.com', 'Admin123456!')}
                  >
                    Visualizador Demo
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Componentes UI básicos que faltan
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

interface TabsProps {
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

interface TabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface TabsTriggerProps {
  value: string;
  children: React.ReactNode;
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AlertDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

// Componentes básicos UI
const Button = ({ className = '', variant = 'default', size = 'default', ...props }: ButtonProps) => {
  const baseClasses = 'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50';
  
  const variantClasses = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground'
  };
  
  const sizeClasses = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 rounded-md px-3',
    lg: 'h-11 rounded-md px-8'
  };
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    />
  );
};

const Input = ({ className = '', ...props }: InputProps) => {
  const classes = `flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`;
  
  return <input className={classes} {...props} />;
};

const Label = ({ className = '', ...props }: LabelProps) => {
  const classes = `text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${className}`;
  
  return <label className={classes} {...props} />;
};

const Card = ({ className = '', ...props }: CardProps) => {
  const classes = `rounded-lg border bg-card text-card-foreground shadow-sm ${className}`;
  
  return <div className={classes} {...props} />;
};

const CardHeader = ({ className = '', ...props }: CardProps) => {
  const classes = `flex flex-col space-y-1.5 p-6 ${className}`;
  
  return <div className={classes} {...props} />;
};

const CardTitle = ({ className = '', ...props }: CardProps) => {
  const classes = `text-2xl font-semibold leading-none tracking-tight ${className}`;
  
  return <h3 className={classes} {...props} />;
};

const CardDescription = ({ className = '', ...props }: CardProps) => {
  const classes = `text-sm text-muted-foreground ${className}`;
  
  return <p className={classes} {...props} />;
};

const CardContent = ({ className = '', ...props }: CardProps) => {
  const classes = `p-6 pt-0 ${className}`;
  
  return <div className={classes} {...props} />;
};

const Tabs = ({ defaultValue, className = '', children }: TabsProps) => {
  return (
    <div className={`w-full ${className}`} data-value={defaultValue}>
      {children}
    </div>
  );
};

const TabsList = ({ className = '', children }: TabsListProps) => {
  const classes = `inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground ${className}`;
  
  return <div className={classes}>{children}</div>;
};

const TabsTrigger = ({ value, children }: TabsTriggerProps) => {
  return (
    <button className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm">
      {children}
    </button>
  );
};

const TabsContent = ({ value, children }: TabsContentProps) => {
  return (
    <div className="mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      {children}
    </div>
  );
};

const Alert = ({ className = '', ...props }: AlertProps) => {
  const classes = `relative w-full rounded-lg border p-4 [&>svg~*]:pl-7 [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground ${className}`;
  
  return <div className={classes} {...props} />;
};

const AlertDescription = ({ className = '', ...props }: AlertDescriptionProps) => {
  const classes = `text-sm [&_p]:leading-relaxed ${className}`;
  
  return <div className={classes} {...props} />;
};

export {
  Button,
  Input,
  Label,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Alert,
  AlertDescription
};