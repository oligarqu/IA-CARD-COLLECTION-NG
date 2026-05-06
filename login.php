<?php
session_start();

// Si déjà connecté, rediriger vers index
if(isset($_SESSION['user'])) {
    header('Location: index.php');
    exit();
}
?>

<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Connexion - NationsGlory Cards</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', sans-serif;
            background: linear-gradient(135deg, #0a0c15 0%, #1a1f2e 100%);
            min-height: 100vh;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px;
        }

        .auth-container {
            max-width: 450px;
            width: 100%;
        }

        .auth-card {
            background: rgba(17, 24, 39, 0.95);
            backdrop-filter: blur(10px);
            border-radius: 32px;
            padding: 40px;
            border: 1px solid rgba(255, 180, 71, 0.3);
            box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }

        .logo {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo i {
            font-size: 3rem;
            color: #ffb347;
        }

        .logo h1 {
            font-size: 1.8rem;
            margin-top: 10px;
            background: linear-gradient(135deg, #fff, #ffb347);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
        }

        .tabs {
            display: flex;
            gap: 10px;
            margin-bottom: 30px;
            border-bottom: 1px solid #2d3a5e;
        }

        .tab-btn {
            flex: 1;
            background: none;
            border: none;
            padding: 12px;
            font-size: 1rem;
            font-weight: 600;
            color: #8b9bb5;
            cursor: pointer;
            transition: all 0.2s;
            border-radius: 8px 8px 0 0;
        }

        .tab-btn.active {
            color: #ffb347;
            border-bottom: 2px solid #ffb347;
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #b9c3da;
            font-size: 0.9rem;
        }

        .form-group input {
            width: 100%;
            padding: 14px 16px;
            background: #0f172a;
            border: 1px solid #2d3a5e;
            border-radius: 16px;
            font-size: 1rem;
            color: #edf2ff;
            transition: all 0.2s;
        }

        .form-group input:focus {
            outline: none;
            border-color: #ffb347;
            box-shadow: 0 0 0 2px rgba(255, 180, 71, 0.2);
        }

        .btn-submit {
            width: 100%;
            padding: 14px;
            background: linear-gradient(135deg, #ffb347, #ff8c00);
            border: none;
            border-radius: 40px;
            font-size: 1rem;
            font-weight: 600;
            color: #0f172a;
            cursor: pointer;
            transition: transform 0.2s;
        }

        .btn-submit:hover {
            transform: translateY(-2px);
        }

        .error-message {
            background: rgba(239, 68, 68, 0.2);
            border: 1px solid #ef4444;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 20px;
            color: #fecaca;
            font-size: 0.9rem;
            text-align: center;
        }

        .success-message {
            background: rgba(34, 197, 94, 0.2);
            border: 1px solid #22c55e;
            border-radius: 12px;
            padding: 12px;
            margin-bottom: 20px;
            color: #86efac;
            font-size: 0.9rem;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <div class="logo">
                <i class="fas fa-dragon"></i>
                <h1>NationsGlory Cards</h1>
            </div>

            <div class="tabs">
                <button class="tab-btn active" id="loginTab">Connexion</button>
                <button class="tab-btn" id="registerTab">Inscription</button>
            </div>

            <div id="messageContainer"></div>

            <!-- Formulaire de connexion -->
            <form id="loginForm" style="display: block;">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="exemple@email.com" required>
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" name="password" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn-submit">Se connecter</button>
            </form>

            <!-- Formulaire d'inscription -->
            <form id="registerForm" style="display: none;">
                <div class="form-group">
                    <label>Pseudo</label>
                    <input type="text" name="name" placeholder="Votre pseudo" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" name="email" placeholder="exemple@email.com" required>
                </div>
                <div class="form-group">
                    <label>Mot de passe</label>
                    <input type="password" name="password" placeholder="Minimum 6 caractères" required>
                </div>
                <div class="form-group">
                    <label>Confirmer le mot de passe</label>
                    <input type="password" name="password_confirmation" placeholder="••••••••" required>
                </div>
                <button type="submit" class="btn-submit">S'inscrire</button>
            </form>
        </div>
    </div>

    <script>
        const loginTab = document.getElementById('loginTab');
        const registerTab = document.getElementById('registerTab');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const messageContainer = document.getElementById('messageContainer');

        loginTab.addEventListener('click', () => {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            loginForm.style.display = 'block';
            registerForm.style.display = 'none';
            messageContainer.innerHTML = '';
        });

        registerTab.addEventListener('click', () => {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            registerForm.style.display = 'block';
            loginForm.style.display = 'none';
            messageContainer.innerHTML = '';
        });

        async function showMessage(text, isError = true) {
            messageContainer.innerHTML = `<div class="${isError ? 'error-message' : 'success-message'}">${text}</div>`;
            setTimeout(() => {
                messageContainer.innerHTML = '';
            }, 3000);
        }

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(loginForm);
            
            const response = await fetch('api.php?action=login', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if(result.success) {
                showMessage('Connexion réussie ! Redirection...', false);
                setTimeout(() => {
                    window.location.href = 'index.php';
                }, 1000);
            } else {
                showMessage(result.error || 'Erreur de connexion');
            }
        });

        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(registerForm);
            
            const response = await fetch('api.php?action=register', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if(result.success) {
                showMessage('Inscription réussie ! Vous pouvez vous connecter.', false);
                loginTab.click();
                loginForm.email.value = result.email || '';
            } else {
                showMessage(result.error || 'Erreur lors de l\'inscription');
            }
        });
    </script>
</body>
</html>