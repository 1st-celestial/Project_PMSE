<?php
// Ajout des en-têtes de sécurité
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("X-Content-Type-Options: nosniff");
header("Referrer-Policy: strict-origin-when-cross-origin");
header("Content-Security-Policy: default-src 'self'");

// Démarrer la session avec des paramètres sécurisés
ini_set('session.cookie_httponly', 1);
ini_set('session.cookie_secure', 1);
ini_set('session.use_only_cookies', 1);
session_start();

// Fonction pour gérer les redirections de manière sécurisée
function redirectWithMessage($url, $status, $message = null, $data = null) {
    if ($message) {
        $_SESSION['flash_message'] = $message;
    }
    if ($data) {
        $_SESSION['form_data'] = $data;
    }
    $_SESSION['form_status'] = $status;
    
    // Nettoyer les données de session après la redirection
    if ($status === 'success') {
        unset($_SESSION['form_data']);
        unset($_SESSION['form_errors']);
    }
    
    // Redirection sécurisée
    header('Location: ' . $url, true, 303);
    exit;
}

// Vérifier si le formulaire a été soumis
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Générer un token CSRF si inexistant
    if (!isset($_SESSION['csrf_token'])) {
        $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    }

    // Vérifier le token CSRF
    if (!isset($_POST['csrf_token']) || !hash_equals($_SESSION['csrf_token'], $_POST['csrf_token'])) {
        header('HTTP/1.1 403 Forbidden');
        die('Erreur de sécurité CSRF');
    }

    // Nettoyer et valider les données
    $errors = [];
    $data = [];

    // Fonction de nettoyage
    function cleanInput($data) {
        $data = trim($data);
        $data = stripslashes($data);
        $data = htmlspecialchars($data, ENT_QUOTES, 'UTF-8');
        return $data;
    }

    // Nom
    $data['name'] = cleanInput($_POST['name'] ?? '');
    if (empty($data['name'])) {
        $errors[] = 'Le nom est requis';
    } elseif (!preg_match('/^[a-zA-ZÀ-ÿ\s\-]{2,50}$/', $data['name'])) {
        $errors[] = 'Le nom contient des caractères non autorisés ou est trop long';
    }

    // Email
    $data['email'] = filter_var(cleanInput($_POST['email'] ?? ''), FILTER_SANITIZE_EMAIL);
    if (empty($data['email'])) {
        $errors[] = 'L\'email est requis';
    } elseif (!filter_var($data['email'], FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'L\'email n\'est pas valide';
    }

    // Téléphone
    $data['phone'] = cleanInput($_POST['phone'] ?? '');
    if (empty($data['phone'])) {
        $errors[] = 'Le téléphone est requis';
    } elseif (!preg_match('/^[0-9]{10}$/', $data['phone'])) {
        $errors[] = 'Le téléphone doit contenir 10 chiffres';
    }

    // Projet (optionnel)
    $data['project'] = cleanInput($_POST['project'] ?? '');
    if (strlen($data['project']) > 100) {
        $errors[] = 'Le projet est trop long (max 100 caractères)';
    }

    // Sujet
    $data['subject'] = cleanInput($_POST['subject'] ?? '');
    if (empty($data['subject'])) {
        $errors[] = 'Le sujet est requis';
    } elseif (strlen($data['subject']) > 100) {
        $errors[] = 'Le sujet est trop long (max 100 caractères)';
    }

    // Message
    $data['message'] = cleanInput($_POST['message'] ?? '');
    if (empty($data['message'])) {
        $errors[] = 'Le message est requis';
    } elseif (strlen($data['message']) > 1000) {
        $errors[] = 'Le message est trop long (max 1000 caractères)';
    }

    // Confidentialité
    if (empty($_POST['privacy'])) {
        $errors[] = 'Vous devez accepter la politique de confidentialité';
    }

    // Si pas d'erreurs, envoyer l'email
    if (empty($errors)) {
        // Préparer les entêtes email
        $to = 'gabysbriel@gmail.com';
        $subject = 'Nouveau message: ' . $data['subject'];
        
        // Créer le message en format HTML
        $message = "
        <html>
        <head>
            <title>Nouveau message de contact</title>
        </head>
        <body>
            <h2>Nouveau message de contact</h2>
            <p><strong>Nom:</strong> {$data['name']}</p>
            <p><strong>Email:</strong> {$data['email']}</p>
            <p><strong>Téléphone:</strong> {$data['phone']}</p>
            <p><strong>Projet:</strong> {$data['project']}</p>
            <p><strong>Message:</strong><br>{$data['message']}</p>
        </body>
        </html>";
        
        $headers = "MIME-Version: 1.0\r\n";
        $headers .= "Content-type: text/html; charset=UTF-8\r\n";
        $headers .= "From: {$data['email']}\r\n";
        $headers .= "Reply-To: {$data['email']}\r\n";
        $headers .= "X-Mailer: PHP/" . phpversion();

        // Envoyer l'email
        $mailSent = mail($to, $subject, $message, $headers);

        if ($mailSent) {
            redirectWithMessage(
                'contact.php',
                'success',
                'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.'
            );
        } else {
            $errors[] = 'Erreur lors de l\'envoi de l\'email. Veuillez réessayer plus tard.';
            redirectWithMessage(
                'contact.php',
                'error',
                null,
                $data
            );
        }
    }

    // Si erreurs, rediriger avec les messages d'erreur
    if (!empty($errors)) {
        $_SESSION['form_errors'] = $errors;
        redirectWithMessage(
            'contact.php',
            'error',
            null,
            $data
        );
    }
} else {
    // Générer un nouveau token CSRF pour le formulaire
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    
    // Nettoyer les messages flash si ce n'est pas une soumission de formulaire
    if (isset($_SESSION['flash_message']) && !isset($_GET['status'])) {
        unset($_SESSION['flash_message']);
    }
}

// Le reste de votre HTML (le formulaire) vient ici...
?>