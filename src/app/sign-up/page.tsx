'use client'

import { useState } from 'react'
import { signUp, signInWithOAuth, signInAsDemo } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Github, Chrome, Loader2, Building, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

export default function SignupPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [emailError, setEmailError] = useState('')
    const [passwordError, setPasswordError] = useState('')

    const validateForm = (formData: FormData) => {
        let isValid = true
        const email = formData.get('email') as string
        const password = formData.get('password') as string

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailError('Please enter a valid email address')
            isValid = false
        } else {
            setEmailError('')
        }

        if (password.length < 8) {
            setPasswordError('Password must be at least 8 characters')
            isValid = false
        } else {
            setPasswordError('')
        }

        return isValid
    }

    async function handleSubmit(formData: FormData) {
        if (!validateForm(formData)) return

        setIsLoading(true)
        const result = await signUp(formData)

        if (result?.error) {
            toast.error(result.error)
            setIsLoading(false)
        } else if (result?.success) {
            toast.success(result.message)
            setIsLoading(false)
        }
    }

    async function handleDemoLogin() {
        setIsLoading(true)
        const result = await signInAsDemo()
        if (result?.error) {
            toast.error(result.error)
            setIsLoading(false)
        }
    }


    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4">
            <Link href="/" className="mb-8 flex items-center gap-2">
                <Building className="h-8 w-8 text-blue-600" />
                <span className="font-bold text-2xl tracking-tight">Quormet</span>
            </Link>
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                    <CardDescription>
                        Enter your email and password to create your account
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4">
                    <form action={handleSubmit} className="grid gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" type="text" placeholder="John Doe" required disabled={isLoading} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                name="email"
                                type="email"
                                placeholder="m@example.com"
                                required
                                disabled={isLoading}
                                className={emailError ? 'border-red-500' : ''}
                            />
                            {emailError && <p className="text-sm text-red-500">{emailError}</p>}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    disabled={isLoading}
                                    className={passwordError ? 'border-red-500 pr-10' : 'pr-10'}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {passwordError && <p className="text-sm text-red-500">{passwordError}</p>}
                        </div>
                        <Button className="w-full" type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign Up
                        </Button>
                    </form>

                    <div className="relative my-2">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t" />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                            <span className="bg-white px-2 text-slate-500">Or</span>
                        </div>
                    </div>

                    <div className="grid gap-2">
                        <Button variant="outline" onClick={() => signInWithOAuth('google')} disabled={isLoading} className="w-full justify-start">
                            <Chrome className="mr-2 h-4 w-4" />
                            Continue with Google
                        </Button>
                        <Button variant="outline" onClick={() => signInWithOAuth('github')} disabled={isLoading} className="w-full justify-start">
                            <Github className="mr-2 h-4 w-4" />
                            Continue with Github
                        </Button>
                    </div>

                    <Button
                        variant="ghost"
                        className="w-full text-slate-500 font-normal"
                        onClick={handleDemoLogin}
                        disabled={isLoading}
                    >
                        Try Demo Account
                    </Button>


                </CardContent>
                <CardFooter className="flex flex-col gap-4">
                    <div className="text-sm text-center text-slate-500">
                        Already have an account?{' '}
                        <Link href="/sign-in" className="text-blue-600 hover:underline font-medium">
                            Login
                        </Link>
                    </div>
                </CardFooter>
            </Card>
        </div>
    )
}
