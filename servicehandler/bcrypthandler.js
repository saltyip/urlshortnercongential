import bcrypt from 'bcrypt';

const hashing_logic = async(password) => {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password,saltRounds);
    return hash;
};

export default hashing_logic;