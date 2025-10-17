# xor_generator.py

def xor_string(data: str, key: str) -> str:
    """
    Cifra/descifra una cadena de texto usando una clave con la operación XOR.
    """
    # Repite la clave para que tenga la misma longitud que los datos
    extended_key = (key * (len(data) // len(key) + 1))[:len(data)]
    
    # Realiza la operación XOR caracter por caracter
    xored = [ord(d) ^ ord(k) for d, k in zip(data, extended_key)]
    
    # Devuelve la representación en formato de escape hexadecimal
    return ''.join([f'\\x{c:02x}' for c in xored])

# --- Datos a ofuscar ---
email = "sabbat@mail.sabbat.cloud"
key = "sabbat" # Una clave simple y temática

# --- Generación ---
encrypted_email = xor_string(email, key)
key_binary = ' '.join(format(ord(c), '08b') for c in key)

# --- Salida ---
print(f"Correo electrónico original: {email}")
print(f"Clave: {key}")
print("-" * 20)
print("Para script.js:")
print(f"MEMDUMP (Clave en binario): {key_binary.replace(' ', '')}")
print(f"DATA FRAGMENT (Email cifrado): {encrypted_email}")

# Ejemplo de salida para 'sabbat@mail.sabbat.cloud' con clave 'key':
# MEMDUMP: 011010110110010101111001
# DATA FRAGMENT: \x16\x04\x17\x17\x04\x11\x0c\x16\x0e\x04\x0e\x0e\x04\x0b\x0c\x11\x0e\x04\x0b\x0b\x04\x11
