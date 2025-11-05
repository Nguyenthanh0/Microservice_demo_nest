import bcrypt from 'bcrypt';

const saltRounds = 10;

export const hashPswHelper = async (pass: string) => {
  try {
    return await bcrypt.hash(pass, saltRounds);
  } catch (error) {
    console.log(error);
  }
};

export const comparePswHelper = async (
  plainPasswd: string,
  hashPasswd: string,
) => {
  try {
    return await bcrypt.compare(plainPasswd, hashPasswd);
  } catch (error) {
    console.log(error);
    throw error;
  }
};
