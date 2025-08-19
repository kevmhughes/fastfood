import { CreateUserParams, GetMenuParams, SignInParams } from "@/type";
import { Account, Avatars, Client, Databases, ID, Query, Storage } from "react-native-appwrite";

export const appwriteConfig = {
  endpoint: process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT,
  projectId: process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID,
  platform: "com.company.fastfood",
  databaseId: "689ca88b002b600c0861",
  bucketId: "68a1d70000064fa16155",
  userCollectionId: "689ca8ce001a5c48a3d4",
  categoriesCollectionId: "68a1cff9001da1006a05",
  menuCollectionId: "68a1d0d5001f506963e2",
  customisationsCollectionId: "68a1d558000750ac556b",
  menuCustomisationsCollectionId: "68a1d5fe000c302e0185",
}

export const client = new Client()

// added exclamation mark below to avoid issues with TypeScript strict mode given that these values are not detected in the environment variables but actually exist in the Expo environment
client
  .setEndpoint(appwriteConfig.endpoint!)
  .setProject(appwriteConfig.projectId!)
  .setPlatform(appwriteConfig.platform);

export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
const avatars = new Avatars(client);

export const createUser = async ({ email, password, name }: CreateUserParams) => {
  try {
    const newAccount = await account.create(ID.unique(), email, password, name)
    if (!newAccount) throw Error

    await signIn({ email, password })

    const avatarUrl = avatars.getInitialsURL(name)

    // return newUser
    return await databases.createDocument(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email, name, avatar: avatarUrl
      }
    );

  } catch (error) {
    throw new Error(error as string)
  }
}

export const signIn = async ({ email, password }: SignInParams) => {
  try {
    const session = await account.createEmailPasswordSession(email, password);
  }
  catch (error) {
    throw new Error(error as string)
  }
}

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw Error

    const currentUser = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    )

    if (!currentUser) throw Error;

    return currentUser.documents[0];

  } catch (error) {
    console.log(error)
    throw new Error(error as string);
  }
}

export const getMenu = async ({ category, query }: GetMenuParams) => {
  try {
    const queries: string[] = [];

    if (category) queries.push(Query.equal("categories", category));
    if (query) queries.push(Query.search("name", query))

    const menus = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.menuCollectionId,
      queries,
    )

    return menus.documents;
  } catch (error) {
    throw new Error(error as string)
  }
}

export const getCategories = async () => {
  try {
    const categories = await databases.listDocuments(
      appwriteConfig.databaseId,
      appwriteConfig.categoriesCollectionId,
    )

    return categories.documents;
  } catch (error) {
    throw new Error(error as string)
  }
}